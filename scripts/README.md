# Engine Alto Scripts

This directory contains various scripts for setting up, managing, and maintaining the Engine Alto platform.

## Setup Scripts

### Python & FFmpeg Setup

These scripts automatically install and configure Python and FFmpeg when they are not properly available on your system.

#### Windows
```powershell
# Run the setup script
powershell -ExecutionPolicy Bypass -File scripts\setup-python-ffmpeg.ps1

# Verify installation
scripts\verify_host.ps1
```

#### Linux/macOS
```bash
# Make script executable and run
chmod +x scripts/setup-python-ffmpeg.sh
./scripts/setup-python-ffmpeg.sh

# Verify installation
./scripts/verify-host.sh
```

**What these scripts do:**
- Check if Python and FFmpeg are already installed
- Install Python 3.11 using winget (Windows) or package manager (Linux/macOS)
- Install FFmpeg using winget (Windows) or package manager (Linux/macOS)
- Add installations to system PATH
- Install Hugging Face CLI for model management
- Verify all installations are working correctly

## Verification Scripts

### Host Verification
- `verify_host.ps1` - Windows PowerShell script to check all required tools
- `verify-host.sh` - Linux/macOS bash script to check all required tools

### Full System Verification
- `verify-full.ps1` - Complete system verification including artifact population

## Management Scripts

### Artifact Management
- `artifact-backup.ps1` - Backup artifact data
- `artifact-lifecycle.ps1` - Manage artifact lifecycle
- `create-artifact-folders.ps1` - Create artifact directory structure

### Model Management
- `download-models.ps1` - Download AI models from Hugging Face

### Pipeline Management
- `run-pipelines.ps1` - Execute generation pipelines
- `worker-launcher.ps1` - Launch worker processes

### Development Scripts
- `build_and_run_demo.ps1` - Build and run demo applications
- `training_smoke.ps1` - Run training smoke tests

## Usage Notes

1. **Permissions**: On Unix-like systems, ensure scripts are executable with `chmod +x`
2. **PowerShell**: On Windows, you may need to adjust execution policy for scripts
3. **Dependencies**: Some scripts require specific tools to be installed (Python, FFmpeg, etc.)
4. **Environment**: Scripts are designed to work with the project's environment setup

## Troubleshooting

### Common Issues

**Python not found after installation:**
- Restart your terminal/IDE to pick up PATH changes
- Check that Python was installed to a standard location
- Verify Python is in your system PATH

**FFmpeg not accessible:**
- Ensure FFmpeg binaries are in a directory on your PATH
- Check for conflicting FFmpeg installations
- Verify installation completed successfully

**Permission denied errors:**
- Run scripts with appropriate permissions
- Check antivirus/firewall interference
- Ensure write access to installation directories

### Getting Help

- Check the main documentation for platform-specific guidance
- Review error messages carefully for specific issues
- Consult the troubleshooting section in `docs/future-enhancements.md`

## Script Dependencies

| Script | Dependencies | Purpose |
|--------|-------------|---------|
| setup-python-ffmpeg.ps1 | winget, PowerShell | Install Python & FFmpeg on Windows |
| setup-python-ffmpeg.sh | apt-get/yum/brew | Install Python & FFmpeg on Linux/macOS |
| verify_host.ps1 | PowerShell | Verify tool installations on Windows |
| verify-host.sh | bash, standard Unix tools | Verify tool installations on Linux/macOS |
| download-models.ps1 | Python, Hugging Face CLI | Download AI models |
| run-pipelines.ps1 | Python, FFmpeg | Execute generation pipelines |

## Contributing

When adding new scripts:
1. Follow the existing naming conventions
2. Include appropriate error handling
3. Add documentation for usage and dependencies
4. Test on multiple platforms when possible
5. Update this README with new script information