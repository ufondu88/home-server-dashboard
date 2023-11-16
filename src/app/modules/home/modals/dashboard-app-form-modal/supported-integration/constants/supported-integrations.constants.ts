const PATH_TO_ICONS = "../../../../../../../../assets/icon"

export const SUPPORTED_INTEGRATIONS = [
  {
    name: 'Proxmox',
    friendly_name: 'proxmox',    
    type: 'proxmox',
    port: 8006,
    icon: `${PATH_TO_ICONS}/proxmox.png`
  },
  {
    name: 'Home Assistant',
    friendly_name: 'homeassistant',    
    type: 'homeassistant',
    port: 8123,
    icon: `${PATH_TO_ICONS}/homeassistant.png`
  },
  {
    name: 'Pi-Hole',
    friendly_name: 'pihole',    
    type: 'pihole',
    port: 8080,
    icon: `${PATH_TO_ICONS}/pihole.png`
  },
]