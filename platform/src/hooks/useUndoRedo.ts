import { useState, useCallback, useRef } from 'react';

/**
 * Engine Alto — Undo/Redo Hook
 * Command-stack pattern with configurable history depth.
 * Supports Ctrl+Z (undo) and Ctrl+Shift+Z (redo) keyboard shortcuts.
 */

export interface Command<T = unknown> {
  /** Execute the command (do/redo) */
  execute: () => T;
  /** Reverse the command (undo) */
  undo: () => void;
  /** Human-readable label for history display */
  label?: string;
}

interface UndoRedoState {
  /** Number of undoable commands */
  undoCount: number;
  /** Number of redoable commands */
  redoCount: number;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Labels of undo stack (most recent first) */
  undoLabels: string[];
  /** Labels of redo stack (most recent first) */
  redoLabels: string[];
}

interface UndoRedoActions {
  /** Execute a new command and push it to the undo stack */
  execute: <T>(command: Command<T>) => T;
  /** Undo the most recent command */
  undo: () => void;
  /** Redo the most recently undone command */
  redo: () => void;
  /** Clear all undo/redo history */
  clear: () => void;
  /** Batch multiple commands into a single undo step */
  batch: (label: string, commands: Command[]) => void;
}

export function useUndoRedo(maxHistory: number = 50): [UndoRedoState, UndoRedoActions] {
  const undoStack = useRef<Command[]>([]);
  const redoStack = useRef<Command[]>([]);
  const [, forceUpdate] = useState(0);

  const rerender = useCallback(() => forceUpdate(n => n + 1), []);

  const execute = useCallback(<T,>(command: Command<T>): T => {
    const result = command.execute();
    undoStack.current.push(command);
    // Trim history if exceeding max
    if (undoStack.current.length > maxHistory) {
      undoStack.current = undoStack.current.slice(-maxHistory);
    }
    // Clear redo stack on new command
    redoStack.current = [];
    rerender();
    return result;
  }, [maxHistory, rerender]);

  const undo = useCallback(() => {
    const command = undoStack.current.pop();
    if (command) {
      command.undo();
      redoStack.current.push(command);
      rerender();
    }
  }, [rerender]);

  const redo = useCallback(() => {
    const command = redoStack.current.pop();
    if (command) {
      command.execute();
      undoStack.current.push(command);
      rerender();
    }
  }, [rerender]);

  const clear = useCallback(() => {
    undoStack.current = [];
    redoStack.current = [];
    rerender();
  }, [rerender]);

  const batch = useCallback((label: string, commands: Command[]) => {
    const batchCommand: Command = {
      label,
      execute: () => {
        commands.forEach(cmd => cmd.execute());
      },
      undo: () => {
        // Undo in reverse order
        [...commands].reverse().forEach(cmd => cmd.undo());
      },
    };
    execute(batchCommand);
  }, [execute]);

  const state: UndoRedoState = {
    undoCount: undoStack.current.length,
    redoCount: redoStack.current.length,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
    undoLabels: [...undoStack.current].reverse().map(c => c.label || 'Unnamed').slice(0, 10),
    redoLabels: [...redoStack.current].reverse().map(c => c.label || 'Unnamed').slice(0, 10),
  };

  return [state, { execute, undo, redo, clear, batch }];
}

/**
 * Hook to bind keyboard shortcuts for undo/redo.
 * Call this in your editor component.
 */
export function useUndoRedoKeyboard(actions: UndoRedoActions): void {
  if (typeof window === 'undefined') return;

  // Use useEffect in the component that calls this
  const handler = useCallback((e: KeyboardEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;

    if (isCtrl && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      actions.undo();
    } else if (isCtrl && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      actions.redo();
    } else if (isCtrl && e.key === 'y') {
      e.preventDefault();
      actions.redo();
    }
  }, [actions]);

  // Attach listener
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handler);
  }
}

export default useUndoRedo;
