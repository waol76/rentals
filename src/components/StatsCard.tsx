// StatsCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Info, 
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

export interface StatsCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle?: string;
  secondaryValue?: string;
  trend?: string;
  period?: string;
  info?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  secondaryValue, 
  trend, 
  period = 'This period', 
  info 
}) => {
  const trendValue = trend ? parseFloat(trend) : 0;
  
  return (
    <Card className="bg-white">
      <CardContent className="p-4 h-full">
        <div className="flex gap-3 items-center min-h-[120px]">
          <div className="flex-shrink-0">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2">
              <p className="text-gray-600">{title}</p>
              {info && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-semibold">{value}</h3>
              {trend && (
                <div className={`flex items-center text-sm ${
                  trendValue >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trendValue >= 0 ? 
                    <TrendingUp className="w-4 h-4" /> : 
                    <TrendingDown className="w-4 h-4" />
                  }
                  <span>{Math.abs(trendValue)}%</span>
                </div>
              )}
            </div>
            
            {secondaryValue ? (
              <>
                <p className="text-sm text-gray-400">Gross income</p>
                <div className="mt-2 pt-2 border-t">
                  <p className="text-base text-green-600">{secondaryValue}</p>
                  <p className="text-sm text-gray-400">Net income</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400">{subtitle}</p>
            )}
            
            <p className="text-xs text-gray-400 mt-auto">{period}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
