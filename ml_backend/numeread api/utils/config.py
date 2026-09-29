from pathlib import Path
from typing import Dict, Any

try:
    import yaml
except ImportError:
    yaml = None

class Config:
    def __init__(self, config_path: str = "configs/default.yaml"):
        path = Path(config_path)
        if path.exists():
            if yaml is None:
                raise RuntimeError(
                    "PyYAML is required when loading a YAML configuration file. "
                    "Install it with: pip install PyYAML"
                )
            with path.open('r', encoding='utf-8') as file:
                self.config = yaml.safe_load(file) or {}
        else:
            # The service can run with sensible local defaults; deployments may
            # still provide a YAML file to override them.
            self.config = {}
    
    def get(self, key: str, default: Any = None) -> Any:
        keys = key.split('.')
        value = self.config
        for k in keys:
            value = value.get(k, {})
        return value if value != {} else default
