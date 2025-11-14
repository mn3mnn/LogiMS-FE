import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useMemo } from "react";

interface TimeseriesDataPoint {
  upload_id?: string | number;
  company?: string;
  from_date: string;
  to_date: string;
  [key: string]: any; // For flexible data fields
}

interface TimeseriesChartProps {
  title: string;
  data: TimeseriesDataPoint[];
  valueField: string; // Field name to extract value from (e.g., 'total_net', 'trips')
  labelField?: string; // Field name for label (defaults to company or date range)
  height?: number;
  color?: string;
  type?: "line" | "area";
  showLegend?: boolean;
}

export default function TimeseriesChart({
  title,
  data,
  valueField,
  labelField,
  height = 300,
  color = "#465FFF",
  type = "area",
  showLegend = false,
}: TimeseriesChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return { categories: [], series: [] };
    }

    const categories = data.map((item) => {
      if (labelField && item[labelField]) {
        return item[labelField];
      }
      // Default: use date range or company
      if (item.company) {
        const fromDate = new Date(item.from_date);
        const toDate = new Date(item.to_date);
        return `${item.company} (${fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`;
      }
      const fromDate = new Date(item.from_date);
      return fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const seriesData = data.map((item) => {
      const value = item[valueField];
      return value != null ? Number(value) : 0;
    });

    return { categories, series: seriesData };
  }, [data, valueField, labelField]);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: height,
      type: type,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: {
        enabled: true,
        type: "x",
      },
    },
    colors: [color],
    stroke: {
      curve: "smooth",
      width: type === "area" ? 2 : 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: type === "area" ? 0.4 : 0,
        opacityTo: type === "area" ? 0.1 : 0,
        stops: [0, 90, 100],
      },
    },
    markers: {
      size: 4,
      strokeColors: color,
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      theme: "light",
      y: {
        formatter: (val: number) => {
          if (valueField.includes('net') || valueField.includes('revenue') || valueField.includes('fare')) {
            return `€${val.toFixed(2)}`;
          }
          return val.toLocaleString();
        },
      },
    },
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: "12px",
          colors: "#6B7280",
        },
        rotate: -45,
        rotateAlways: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          colors: "#6B7280",
        },
        formatter: (val: number) => {
          if (valueField.includes('net') || valueField.includes('revenue') || valueField.includes('fare')) {
            return `€${val.toFixed(0)}`;
          }
          return val.toLocaleString();
        },
      },
    },
    legend: {
      show: showLegend,
      position: "top",
      horizontalAlign: "right",
    },
  };

  const series = [
    {
      name: title,
      data: chartData.series,
    },
  ];

  if (chartData.categories.length === 0) {
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
      <Chart options={options} series={series} type={type} height={height} />
    </div>
  );
}

