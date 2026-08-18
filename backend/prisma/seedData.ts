export type SeedNodeType = "course" | "knowledge" | "technology";
export type SeedEdgeType = "prerequisite" | "related" | "recommended-next" | "contains" | "unlocks";

export interface SeedDomain {
  key: string;
  name: string;
  color: string;
  description: string;
  angleDeg: number;
}

export interface SeedNode {
  id: string;
  domain: string;
  type: SeedNodeType;
  name: string;
  description: string;
  moodleCourseId?: number;
  importance?: number;
}

export interface SeedEdge {
  source: string;
  target: string;
  type: SeedEdgeType;
}

const RING_RADIUS = 3200;

export const domains: SeedDomain[] = [
  {
    key: "linux",
    name: "Linux",
    color: "#4ade80",
    description: "Linux and BSD system administration.",
    angleDeg: 0,
  },
  {
    key: "windows",
    name: "Windows",
    color: "#60a5fa",
    description: "Windows Server and enterprise directory services.",
    angleDeg: 36,
  },
  {
    key: "networking",
    name: "Networking",
    color: "#38bdf8",
    description: "Network fundamentals, routing, and security.",
    angleDeg: 72,
  },
  {
    key: "cybersecurity",
    name: "Cybersecurity",
    color: "#f87171",
    description: "Defensive security, monitoring, and incident response.",
    angleDeg: 108,
  },
  {
    key: "virtualization",
    name: "Virtualization",
    color: "#c084fc",
    description: "Hypervisors, containers, and orchestration.",
    angleDeg: 144,
  },
  {
    key: "cloud",
    name: "Cloud",
    color: "#fbbf24",
    description: "Public cloud platforms and cloud-native architecture.",
    angleDeg: 180,
  },
  {
    key: "programming",
    name: "Programming",
    color: "#34d399",
    description: "Software development fundamentals and tooling.",
    angleDeg: 216,
  },
  {
    key: "databases",
    name: "Databases",
    color: "#fb923c",
    description: "Relational and non-relational data storage.",
    angleDeg: 252,
  },
  {
    key: "automation",
    name: "Automation",
    color: "#a78bfa",
    description: "Infrastructure automation and CI/CD.",
    angleDeg: 288,
  },
  {
    key: "itsm",
    name: "IT Service Management",
    color: "#94a3b8",
    description: "ITIL processes for delivering IT services.",
    angleDeg: 324,
  },
];

export const nodes: SeedNode[] = [
  // Linux
  {
    id: "linux-basics",
    domain: "linux",
    type: "knowledge",
    name: "Linux Basics",
    description: "Core Linux concepts: filesystem, shell, package management.",
    importance: 4,
  },
  {
    id: "linux-administration",
    domain: "linux",
    type: "course",
    name: "Linux Administration",
    description: "Linux and BSD operating system administration.",
    moodleCourseId: 55,
    importance: 5,
  },
  {
    id: "ubuntu",
    domain: "linux",
    type: "technology",
    name: "Ubuntu",
    description: "Popular Debian-based Linux distribution.",
    importance: 2,
  },
  {
    id: "debian",
    domain: "linux",
    type: "technology",
    name: "Debian",
    description: "Stable, widely used Linux distribution.",
    importance: 2,
  },
  {
    id: "bash",
    domain: "linux",
    type: "knowledge",
    name: "Bash",
    description: "Shell scripting for automating Linux tasks.",
    importance: 3,
  },
  {
    id: "linux-permissions",
    domain: "linux",
    type: "knowledge",
    name: "Linux Permissions",
    description: "Users, groups, and file permission models.",
    importance: 3,
  },
  {
    id: "ssh",
    domain: "linux",
    type: "technology",
    name: "SSH",
    description: "Secure remote access protocol.",
    importance: 3,
  },
  {
    id: "nginx",
    domain: "linux",
    type: "technology",
    name: "Nginx",
    description: "High-performance web server and reverse proxy.",
    importance: 2,
  },

  // Windows
  {
    id: "windows-basics",
    domain: "windows",
    type: "knowledge",
    name: "Windows Basics",
    description: "Core Windows administration concepts.",
    importance: 4,
  },
  {
    id: "windows-server",
    domain: "windows",
    type: "course",
    name: "Windows Server",
    description: "Windows Server installation and administration.",
    moodleCourseId: 81,
    importance: 5,
  },
  {
    id: "active-directory",
    domain: "windows",
    type: "knowledge",
    name: "Active Directory",
    description: "Centralized directory and identity management.",
    importance: 3,
  },
  {
    id: "group-policy",
    domain: "windows",
    type: "knowledge",
    name: "Group Policy",
    description: "Centralized configuration management for Windows.",
    importance: 2,
  },
  {
    id: "powershell",
    domain: "windows",
    type: "technology",
    name: "PowerShell",
    description: "Task automation and configuration management shell.",
    importance: 3,
  },

  // Networking
  {
    id: "networking-fundamentals",
    domain: "networking",
    type: "course",
    name: "Networking Fundamentals",
    description: "Computer networking fundamentals.",
    moodleCourseId: 61,
    importance: 5,
  },
  {
    id: "tcp-ip",
    domain: "networking",
    type: "knowledge",
    name: "TCP/IP",
    description: "The core protocol suite of the internet.",
    importance: 4,
  },
  {
    id: "ipv4",
    domain: "networking",
    type: "technology",
    name: "IPv4",
    description: "32-bit addressing scheme.",
    importance: 2,
  },
  {
    id: "ipv6",
    domain: "networking",
    type: "technology",
    name: "IPv6",
    description: "Next-generation IP addressing.",
    importance: 2,
  },
  {
    id: "vlan",
    domain: "networking",
    type: "knowledge",
    name: "VLAN",
    description: "Logical network segmentation.",
    importance: 2,
  },
  {
    id: "routing",
    domain: "networking",
    type: "knowledge",
    name: "Routing",
    description: "Directing traffic between networks.",
    importance: 3,
  },
  {
    id: "switching",
    domain: "networking",
    type: "knowledge",
    name: "Switching",
    description: "Layer 2 frame forwarding.",
    importance: 3,
  },
  {
    id: "firewall",
    domain: "networking",
    type: "technology",
    name: "Firewall",
    description: "Traffic filtering and access control.",
    importance: 3,
  },
  {
    id: "vpn",
    domain: "networking",
    type: "technology",
    name: "VPN",
    description: "Encrypted tunnels across untrusted networks.",
    importance: 3,
  },
  {
    id: "network-security",
    domain: "networking",
    type: "knowledge",
    name: "Network Security",
    description: "Protecting network infrastructure and traffic.",
    importance: 4,
  },

  // Cybersecurity
  {
    id: "cybersecurity-fundamentals",
    domain: "cybersecurity",
    type: "course",
    name: "Cybersecurity Fundamentals",
    description: "Foundational cybersecurity concepts.",
    moodleCourseId: 73,
    importance: 5,
  },
  {
    id: "nmap",
    domain: "cybersecurity",
    type: "technology",
    name: "Nmap",
    description: "Network discovery and security auditing tool.",
    importance: 2,
  },
  {
    id: "web-security",
    domain: "cybersecurity",
    type: "knowledge",
    name: "Web Security",
    description: "Securing web applications and services.",
    importance: 3,
  },
  {
    id: "owasp",
    domain: "cybersecurity",
    type: "knowledge",
    name: "OWASP Top 10",
    description: "The most critical web application security risks.",
    importance: 3,
  },
  {
    id: "siem",
    domain: "cybersecurity",
    type: "technology",
    name: "SIEM",
    description: "Security information and event management.",
    importance: 3,
  },
  {
    id: "ids-ips",
    domain: "cybersecurity",
    type: "knowledge",
    name: "IDS/IPS",
    description: "Intrusion detection and prevention systems.",
    importance: 2,
  },
  {
    id: "incident-response",
    domain: "cybersecurity",
    type: "knowledge",
    name: "Incident Response",
    description: "Handling and recovering from security incidents.",
    importance: 3,
  },

  // Virtualization
  {
    id: "virtualization-fundamentals",
    domain: "virtualization",
    type: "knowledge",
    name: "Virtualization Fundamentals",
    description: "Core concepts of hardware and OS virtualization.",
    importance: 4,
  },
  {
    id: "proxmox",
    domain: "virtualization",
    type: "technology",
    name: "Proxmox",
    description: "Open-source virtualization management platform.",
    importance: 2,
  },
  {
    id: "vmware",
    domain: "virtualization",
    type: "technology",
    name: "VMware",
    description: "Enterprise virtualization platform.",
    importance: 2,
  },
  {
    id: "hyper-v",
    domain: "virtualization",
    type: "technology",
    name: "Hyper-V",
    description: "Microsoft's native hypervisor.",
    importance: 2,
  },
  {
    id: "containers-orchestration",
    domain: "virtualization",
    type: "course",
    name: "Containers & Kubernetes",
    description: "Container platforms and orchestration.",
    moodleCourseId: 92,
    importance: 5,
  },
  {
    id: "kubernetes",
    domain: "virtualization",
    type: "technology",
    name: "Kubernetes",
    description: "Container orchestration at scale.",
    importance: 3,
  },

  // Cloud
  {
    id: "cloud-fundamentals",
    domain: "cloud",
    type: "course",
    name: "Cloud Fundamentals",
    description: "Public cloud platforms: AWS and Azure.",
    moodleCourseId: 104,
    importance: 5,
  },
  {
    id: "aws",
    domain: "cloud",
    type: "technology",
    name: "AWS",
    description: "Amazon Web Services cloud platform.",
    importance: 3,
  },
  {
    id: "azure",
    domain: "cloud",
    type: "technology",
    name: "Azure",
    description: "Microsoft's cloud computing platform.",
    importance: 3,
  },
  {
    id: "cloud-networking",
    domain: "cloud",
    type: "knowledge",
    name: "Cloud Networking",
    description: "Virtual networks in the cloud.",
    importance: 2,
  },
  {
    id: "cloud-security",
    domain: "cloud",
    type: "knowledge",
    name: "Cloud Security",
    description: "Securing cloud infrastructure and data.",
    importance: 3,
  },

  // Programming
  {
    id: "programming-fundamentals",
    domain: "programming",
    type: "knowledge",
    name: "Programming Fundamentals",
    description: "Variables, control flow, functions, and data structures.",
    importance: 4,
  },
  {
    id: "python",
    domain: "programming",
    type: "course",
    name: "Python Programming",
    description: "General-purpose programming with Python.",
    moodleCourseId: 112,
    importance: 5,
  },
  {
    id: "javascript",
    domain: "programming",
    type: "technology",
    name: "JavaScript",
    description: "Scripting language for the web.",
    importance: 3,
  },
  {
    id: "rest-apis",
    domain: "programming",
    type: "knowledge",
    name: "REST APIs",
    description: "Designing and consuming HTTP APIs.",
    importance: 3,
  },
  {
    id: "git",
    domain: "programming",
    type: "technology",
    name: "Git",
    description: "Distributed version control.",
    importance: 3,
  },
  {
    id: "oop",
    domain: "programming",
    type: "knowledge",
    name: "Object-Oriented Programming",
    description: "Classes, objects, and design principles.",
    importance: 2,
  },

  // Databases
  {
    id: "sql-databases",
    domain: "databases",
    type: "course",
    name: "Databases & SQL",
    description: "Relational database design and SQL.",
    moodleCourseId: 120,
    importance: 5,
  },
  {
    id: "postgresql",
    domain: "databases",
    type: "technology",
    name: "PostgreSQL",
    description: "Advanced open-source relational database.",
    importance: 3,
  },
  {
    id: "mysql",
    domain: "databases",
    type: "technology",
    name: "MySQL",
    description: "Popular open-source relational database.",
    importance: 2,
  },
  {
    id: "database-design",
    domain: "databases",
    type: "knowledge",
    name: "Database Design",
    description: "Schema design and normalization.",
    importance: 3,
  },
  {
    id: "nosql",
    domain: "databases",
    type: "knowledge",
    name: "NoSQL",
    description: "Non-relational data storage models.",
    importance: 2,
  },

  // Automation
  {
    id: "automation-fundamentals",
    domain: "automation",
    type: "knowledge",
    name: "Automation Fundamentals",
    description: "Principles of infrastructure automation.",
    importance: 4,
  },
  {
    id: "ansible",
    domain: "automation",
    type: "course",
    name: "Infrastructure Automation with Ansible",
    description: "Configuration management and automation with Ansible.",
    moodleCourseId: 131,
    importance: 5,
  },
  {
    id: "infrastructure-as-code",
    domain: "automation",
    type: "knowledge",
    name: "Infrastructure as Code",
    description: "Declaratively managing infrastructure.",
    importance: 3,
  },
  {
    id: "ci-cd",
    domain: "automation",
    type: "knowledge",
    name: "CI/CD",
    description: "Continuous integration and delivery pipelines.",
    importance: 3,
  },
  {
    id: "docker",
    domain: "automation",
    type: "technology",
    name: "Docker",
    description: "Application containerization platform.",
    importance: 4,
  },

  // ITSM
  {
    id: "itil-foundations",
    domain: "itsm",
    type: "course",
    name: "ITIL Foundations",
    description: "ITIL framework for IT service management.",
    moodleCourseId: 140,
    importance: 5,
  },
  {
    id: "service-desk",
    domain: "itsm",
    type: "knowledge",
    name: "Service Desk",
    description: "Single point of contact for IT support.",
    importance: 2,
  },
  {
    id: "incident-management",
    domain: "itsm",
    type: "knowledge",
    name: "Incident Management",
    description: "Restoring normal service operation quickly.",
    importance: 3,
  },
  {
    id: "change-management",
    domain: "itsm",
    type: "knowledge",
    name: "Change Management",
    description: "Controlling IT infrastructure changes.",
    importance: 3,
  },
  {
    id: "problem-management",
    domain: "itsm",
    type: "knowledge",
    name: "Problem Management",
    description: "Root cause analysis of recurring incidents.",
    importance: 2,
  },
];

export const edges: SeedEdge[] = [
  // Linux
  { source: "linux-basics", target: "linux-administration", type: "prerequisite" },
  { source: "linux-administration", target: "bash", type: "contains" },
  { source: "linux-administration", target: "linux-permissions", type: "contains" },
  { source: "linux-administration", target: "ssh", type: "contains" },
  { source: "linux-administration", target: "nginx", type: "related" },
  { source: "linux-basics", target: "ubuntu", type: "related" },
  { source: "linux-basics", target: "debian", type: "related" },
  { source: "linux-administration", target: "docker", type: "recommended-next" },
  { source: "linux-administration", target: "ansible", type: "recommended-next" },

  // Windows
  { source: "windows-basics", target: "windows-server", type: "prerequisite" },
  { source: "windows-server", target: "active-directory", type: "contains" },
  { source: "active-directory", target: "group-policy", type: "contains" },
  { source: "windows-server", target: "powershell", type: "related" },

  // Networking
  { source: "networking-fundamentals", target: "tcp-ip", type: "contains" },
  { source: "tcp-ip", target: "ipv4", type: "contains" },
  { source: "tcp-ip", target: "ipv6", type: "contains" },
  { source: "networking-fundamentals", target: "vlan", type: "contains" },
  { source: "networking-fundamentals", target: "routing", type: "contains" },
  { source: "networking-fundamentals", target: "switching", type: "contains" },
  { source: "networking-fundamentals", target: "firewall", type: "recommended-next" },
  { source: "firewall", target: "vpn", type: "related" },
  { source: "vpn", target: "network-security", type: "related" },
  { source: "network-security", target: "cybersecurity-fundamentals", type: "recommended-next" },

  // Cybersecurity
  { source: "cybersecurity-fundamentals", target: "nmap", type: "contains" },
  { source: "cybersecurity-fundamentals", target: "web-security", type: "contains" },
  { source: "web-security", target: "owasp", type: "related" },
  { source: "cybersecurity-fundamentals", target: "siem", type: "recommended-next" },
  { source: "siem", target: "ids-ips", type: "related" },
  { source: "ids-ips", target: "incident-response", type: "related" },
  { source: "cybersecurity-fundamentals", target: "network-security", type: "prerequisite" },

  // Virtualization
  { source: "virtualization-fundamentals", target: "proxmox", type: "related" },
  { source: "virtualization-fundamentals", target: "vmware", type: "related" },
  { source: "virtualization-fundamentals", target: "hyper-v", type: "related" },
  {
    source: "virtualization-fundamentals",
    target: "containers-orchestration",
    type: "recommended-next",
  },
  { source: "containers-orchestration", target: "kubernetes", type: "contains" },
  { source: "docker", target: "containers-orchestration", type: "prerequisite" },
  { source: "containers-orchestration", target: "cloud-fundamentals", type: "recommended-next" },

  // Cloud
  { source: "cloud-fundamentals", target: "aws", type: "contains" },
  { source: "cloud-fundamentals", target: "azure", type: "contains" },
  { source: "cloud-fundamentals", target: "cloud-networking", type: "contains" },
  { source: "cloud-fundamentals", target: "cloud-security", type: "related" },
  { source: "virtualization-fundamentals", target: "cloud-fundamentals", type: "recommended-next" },

  // Programming
  { source: "programming-fundamentals", target: "python", type: "prerequisite" },
  { source: "programming-fundamentals", target: "javascript", type: "prerequisite" },
  { source: "python", target: "rest-apis", type: "related" },
  { source: "programming-fundamentals", target: "git", type: "related" },
  { source: "programming-fundamentals", target: "oop", type: "contains" },
  { source: "python", target: "ansible", type: "recommended-next" },

  // Databases
  { source: "sql-databases", target: "postgresql", type: "contains" },
  { source: "sql-databases", target: "mysql", type: "contains" },
  { source: "sql-databases", target: "database-design", type: "contains" },
  { source: "database-design", target: "nosql", type: "related" },
  { source: "python", target: "sql-databases", type: "recommended-next" },

  // Automation
  { source: "automation-fundamentals", target: "ansible", type: "prerequisite" },
  { source: "ansible", target: "infrastructure-as-code", type: "related" },
  { source: "infrastructure-as-code", target: "ci-cd", type: "related" },
  { source: "automation-fundamentals", target: "docker", type: "related" },
  { source: "ci-cd", target: "containers-orchestration", type: "recommended-next" },

  // ITSM
  { source: "itil-foundations", target: "service-desk", type: "contains" },
  { source: "itil-foundations", target: "incident-management", type: "contains" },
  { source: "itil-foundations", target: "change-management", type: "contains" },
  { source: "change-management", target: "problem-management", type: "related" },
  { source: "incident-management", target: "incident-response", type: "unlocks" },
];

export function domainCenter(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.round(Math.cos(rad) * RING_RADIUS), y: Math.round(Math.sin(rad) * RING_RADIUS) };
}

const GOLDEN_ANGLE = 137.50776;

/** Vogel spiral: node 0 sits at the domain center, later nodes spiral outward. */
export function nodePosition(
  centerX: number,
  centerY: number,
  indexInDomain: number
): { x: number; y: number } {
  if (indexInDomain === 0) return { x: centerX, y: centerY };
  const angle = (indexInDomain * GOLDEN_ANGLE * Math.PI) / 180;
  const radius = 130 * Math.sqrt(indexInDomain);
  return {
    x: Math.round(centerX + Math.cos(angle) * radius),
    y: Math.round(centerY + Math.sin(angle) * radius),
  };
}
