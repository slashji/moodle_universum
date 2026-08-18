import type { MoodleCourse, MoodleUser } from "@moodle-universum/shared";
import type { MoodleProvider } from "./types.js";

const MOCK_USER: MoodleUser = {
  id: 123,
  fullname: "Example Student",
  email: "student@example.test",
};

const MOCK_COURSES: MoodleCourse[] = [
  {
    id: 55,
    fullname: "Linux/BSD Operating Systems",
    shortname: "LINUX-BSD",
    category: "Operating Systems",
    completion: 72,
    completed: false,
  },
  {
    id: 61,
    fullname: "Computer Networks",
    shortname: "NETWORKS",
    category: "Networking",
    completion: 100,
    completed: true,
  },
  {
    id: 73,
    fullname: "Cybersecurity Fundamentals",
    shortname: "CYBERSEC",
    category: "Cybersecurity",
    completion: 25,
    completed: false,
  },
  {
    id: 81,
    fullname: "Windows Server Administration",
    shortname: "WINSRV",
    category: "Operating Systems",
    completion: 100,
    completed: true,
  },
  {
    id: 92,
    fullname: "Containers & Kubernetes",
    shortname: "K8S",
    category: "Virtualization",
    completion: 40,
    completed: false,
  },
  {
    id: 104,
    fullname: "Cloud Fundamentals (AWS/Azure)",
    shortname: "CLOUD101",
    category: "Cloud",
    completion: 0,
    completed: false,
  },
  {
    id: 112,
    fullname: "Python Programming",
    shortname: "PYTHON",
    category: "Programming",
    completion: 88,
    completed: false,
  },
  {
    id: 120,
    fullname: "Databases & SQL",
    shortname: "SQLDB",
    category: "Databases",
    completion: 55,
    completed: false,
  },
  {
    id: 131,
    fullname: "Infrastructure Automation with Ansible",
    shortname: "ANSIBLE",
    category: "Automation",
    completion: 15,
    completed: false,
  },
  {
    id: 140,
    fullname: "ITIL Foundations",
    shortname: "ITIL",
    category: "IT Service Management",
    completion: null,
    completed: false,
  },
];

/**
 * Returns realistic development data without needing a real Moodle server.
 * Selected via MOODLE_PROVIDER=mock (the default).
 */
export class MockMoodleProvider implements MoodleProvider {
  async getCurrentUser(): Promise<MoodleUser> {
    return MOCK_USER;
  }

  async getEnrolledCourses(_userId: number): Promise<MoodleCourse[]> {
    return MOCK_COURSES;
  }
}
