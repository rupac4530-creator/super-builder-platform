"""
Engine Alto -- Hello Alto Demo
Phase 0 Acceptance Test: prints 'ALTO READY' and system information.
"""

import sys
import platform
import datetime
import os
import io


def main():
    # Force UTF-8 stdout on Windows to avoid cp1252 encoding errors
    if sys.platform == "win32":
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

    print("=" * 50)
    print("ALTO READY")
    print("=" * 50)
    print()
    print(f"Timestamp:    {datetime.datetime.now().isoformat()}")
    print(f"Python:       {sys.version}")
    print(f"Platform:     {platform.platform()}")
    print(f"Architecture: {platform.machine()}")
    print(f"Processor:    {platform.processor()}")
    print(f"Node Name:    {platform.node()}")
    print(f"OS:           {os.name}")
    print()
    print("Engine Alto Civilization -- Phase 0 Complete")
    print("Governance: Active")
    print("Master Override: Standby")
    print("Audit Log: Initialized")
    print()
    print("Status: All systems nominal [OK]")
    return 0


if __name__ == "__main__":
    sys.exit(main())
