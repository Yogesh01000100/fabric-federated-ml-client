#!/bin/bash

# Stop the IPFS daemon and disable the service
echo "Stopping and disabling IPFS service..."
sudo systemctl stop ipfs-node.service
sudo systemctl disable ipfs-node.service

# Remove the IPFS service file
echo "Removing IPFS service file..."
sudo rm /etc/systemd/system/ipfs-node.service
sudo systemctl daemon-reload

# Remove IPFS binary from local bin
echo "Removing IPFS from /usr/local/bin..."
sudo rm /usr/local/bin/ipfs

# Optionally, clean up the IPFS data directory
echo "Cleaning up IPFS data..."
rm -rf ~/.ipfs

# Revert UDP buffer size settings by commenting out the lines we added
echo "Reverting UDP buffer size settings..."
sudo sed -i '/^net.core.rmem_max=2097152$/s/^/#/' /etc/sysctl.conf
sudo sed -i '/^net.core.rmem_default=2097152$/s/^/#/' /etc/sysctl.conf
sudo sed -i '/^net.core.wmem_max=2097152$/s/^/#/' /etc/sysctl.conf
sudo sed -i '/^net.core.wmem_default=2097152$/s/^/#/' /etc/sysctl.conf
sudo sysctl -p

# Remove downloaded and extracted IPFS files (assuming script is run from the directory where files were downloaded)
echo "Removing downloaded IPFS files..."
rm -rf kubo*
rm kubo_v0.28.0_linux-amd64.tar.gz

echo "Cleanup complete."
