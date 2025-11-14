import React from "react";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  onClick,
  className = "",
}: MetricCardProps) {
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : value;

  return (
    <div
      className={`rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-blue-300" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4 p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-3xl font-bold text-gray-900">{formattedValue}</h3>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-xs font-semibold flex items-center ${
                  trend.isPositive !== false ? "text-emerald-600" : "text-red-600"
                }`}
              >
                <svg
                  className={`w-3 h-3 mr-1 ${trend.isPositive !== false ? "" : "rotate-180"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

