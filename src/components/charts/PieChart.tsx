import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useMemo } from "react";

interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  title: string;
  data: PieChartData[];
  height?: number;
  type?: "pie" | "donut";
  showLegend?: boolean;
  legendPosition?: "bottom" | "top" | "left" | "right";
}

export default function PieChart({
  title,
  data,
  height = 300,
  type = "donut",
  showLegend = true,
  legendPosition = "bottom",
}: PieChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { labels: [], series: [] };
    }

    const labels = data.map((item) => item.label);
    const series = data.map((item) => item.value);

    return { labels, series };
  }, [data]);

  // Default color palette
  const defaultColors = [
    "#465FFF",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#F97316",
    "#EC4899",
  ];

  const colors = useMemo(() => {
    return data.map((item, index) => item.color || defaultColors[index % defaultColors.length]);
  }, [data]);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: type,
      height: height,
      toolbar: {
        show: false,
      },
    },
    colors: colors,
    labels: chartData.labels,
    legend: {
      show: showLegend,
      position: legendPosition,
      fontSize: "12px",
      fontFamily: "Outfit, sans-serif",
      labels: {
        colors: "#6B7280",
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number, opts: any) => {
        // Show percentage for slices >= 1%, otherwise show count
        if (val >= 1) {
          return `${val.toFixed(1)}%`;
        }
        // For very small slices, show the actual count instead
        const total = chartData.series.reduce((a: number, b: number) => a + b, 0);
        const count = Math.round((val / 100) * total);
        return count > 0 ? count.toString() : '';
      },
      style: {
        fontSize: "12px",
        fontWeight: 600,
        colors: ["#fff"],
      },
      minAngleToShowLabel: 0, // Show labels even for very small slices
    },
    plotOptions: {
      pie: {
        donut: type === "donut" ? {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontWeight: 600,
              color: "#374151",
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 700,
              color: "#111827",
              formatter: (val: string) => {
                const total = chartData.series.reduce((a, b) => a + b, 0);
                const value = (parseFloat(val) / 100) * total;
                return value.toLocaleString();
              },
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 600,
              color: "#6B7280",
              formatter: () => {
                const total = chartData.series.reduce((a, b) => a + b, 0);
                return total.toLocaleString();
              },
            },
          },
        } : undefined,
        expandOnClick: true,
      },
    },
    tooltip: {
      enabled: true,
      theme: "light",
      y: {
        formatter: (val: number, { seriesIndex }: { seriesIndex: number }) => {
          const item = data[seriesIndex];
          return `${item.label}: ${val.toLocaleString()}`;
        },
      },
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          chart: {
            height: height * 0.8,
          },
          legend: {
            position: "bottom",
            fontSize: "11px",
          },
        },
      },
    ],
  };

  if (chartData.labels.length === 0) {
    return (
      <div className="rounded-xl border p-6 bg-gray-50">
        <div className="text-sm font-medium mb-2">{title}</div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="text-sm font-medium mb-4">{title}</div>
      <Chart options={options} series={chartData.series} type={type} height={height} />
    </div>
  );
}

