import React, { useState, useEffect } from 'react';
import { AuthToken, UserRole } from '../types';

interface AccountExpirationAlertProps {
  authToken: AuthToken | null;
}

const AccountExpirationAlert: React.FC<AccountExpirationAlertProps> = ({ authToken }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!authToken) return;

    const updateTimeLeft = () => {
      const now = Date.now();
      const expiresAt = authToken.expiresAt;
      const diff = expiresAt - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('已过期');
        return;
      }

      setIsExpired(false);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}天 ${hours}小时`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}小时 ${minutes}分钟`);
      } else {
        setTimeLeft(`${minutes}分钟`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, [authToken]);

  if (!authToken) return null;

  const isAdmin = authToken.userInfo.role === UserRole.ADMIN;

  return (
    <div className="mt-2">
      <div className="text-xs text-red-600">
        {isExpired ? (
          <div>账户已过期，请联系管理员</div>
        ) : (
          <div>
            <div>
              {isAdmin ? '管理员账户' : authToken.userInfo.isTrial ? '试用账户' : '正式账户'}
            </div>
            <div className="mt-0.5 opacity-80">
              剩余: {timeLeft}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountExpirationAlert;
