import React from 'react';
import { IoShield, IoPerson, IoSettings } from 'react-icons/io5';
import { getCurrentUserRole, setUserRole, USER_ROLES } from '../../utils/auth';

const RoleSwitcher = () => {
  const currentRole = getCurrentUserRole();

  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    window.location.reload(); // Refresh to apply role changes
  };

  const roles = [
    { 
      value: USER_ROLES.USER, 
      label: 'Khách hàng', 
      icon: IoPerson,
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    },
    { 
      value: USER_ROLES.STAFF, 
      label: 'Nhân viên', 
      icon: IoSettings,
      color: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    },
    { 
      value: USER_ROLES.ADMIN, 
      label: 'Quản trị viên', 
      icon: IoShield,
      color: 'bg-red-100 text-red-800 hover:bg-red-200'
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Demo: Chuyển đổi vai trò
      </div>
      <div className="space-y-2">
        {roles.map((role) => {
          const Icon = role.icon;
          const isActive = currentRole === role.value;
          
          return (
            <button
              key={role.value}
              onClick={() => handleRoleChange(role.value)}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? role.color + ' ring-2 ring-offset-1 ring-blue-500' 
                  : role.color
              }`}
            >
              <Icon size={16} />
              <span>{role.label}</span>
              {isActive && (
                <span className="ml-auto text-xs">✓</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Hiện tại: {roles.find(r => r.value === currentRole)?.label}
      </div>
    </div>
  );
};

export default RoleSwitcher;
