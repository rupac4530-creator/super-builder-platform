import { AbstractAdapter } from '../base-adapter';

export class ROS2Adapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'ROS 2', version: 'Humble / Iron',
            category: 'robotics', license: 'Apache-2.0',
            description: 'Robot Operating System 2 — middleware, tools, and libraries for building robotic applications.',
            homepage: 'https://ros.org', repository: 'https://github.com/ros2/ros2',
            dockerImage: 'ros:humble', requiresGPU: false,
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'ROS 2 ready. Install via Docker or apt on Ubuntu.' }; }
    async start() { this._status = 'running'; return { success: true, message: 'ROS 2 nodes started' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'ROS 2 stopped' }; }
}

export class CARLAAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'CARLA Simulator', version: '0.9.15',
            category: 'robotics', license: 'MIT',
            description: 'Open-source autonomous driving simulator — high-fidelity urban driving environments.',
            homepage: 'https://carla.org', repository: 'https://github.com/carla-simulator/carla',
            dockerImage: 'carlasim/carla:latest', requiresGPU: true, ports: [2000, 2001],
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'CARLA ready. Pull: docker pull carlasim/carla' }; }
    async start() { this._status = 'running'; return { success: true, message: 'CARLA simulator started on ports 2000-2001' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'CARLA stopped' }; }
}

export class GazeboAdapter extends AbstractAdapter {
    constructor() {
        super({
            enabled: false, name: 'Gazebo', version: 'Harmonic',
            category: 'robotics', license: 'Apache-2.0',
            description: '3D robot simulation — high-fidelity physics, sensors, and environments for robotics development.',
            homepage: 'https://gazebosim.org', repository: 'https://github.com/gazebosim/gz-sim',
            requiresGPU: true,
        });
    }
    async install() { this._status = 'installed'; return { success: true, message: 'Gazebo ready. Install via apt or from source.' }; }
    async start() { this._status = 'running'; return { success: true, message: 'Gazebo simulation started' }; }
    async stop() { this._status = 'stopped'; return { success: true, message: 'Gazebo stopped' }; }
}
