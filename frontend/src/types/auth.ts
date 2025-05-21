export interface LoginUser {
  id: string;
  email: string;
  phoneNumber: string;
  username: string;
  managementDashboardName: string | null;
  departmentName: string | null;
  userType: string;
  role: string;
} 