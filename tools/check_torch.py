import torch
print(f'PyTorch {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'GPU: {torch.cuda.get_device_name(0)}')
    props = torch.cuda.get_device_properties(0)
    print(f'VRAM: {props.total_mem / 1024**3:.1f} GB')
    print(f'CUDA version: {torch.version.cuda}')
else:
    print('No CUDA GPU detected by PyTorch')
