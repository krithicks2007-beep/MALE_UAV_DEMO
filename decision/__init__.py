"""
Alias forwarder for decision_support package
"""
import sys
import os

# Forward imports to decision_support
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from decision_support import *  # noqa: F401, F403
