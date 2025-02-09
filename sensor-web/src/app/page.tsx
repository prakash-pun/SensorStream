"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Smartphone,
  Compass,
  GaugeIcon as Speedometer,
  Crosshair,
  Mountain,
} from "lucide-react";
import LocationMap from "@/components/location-map";
import { useSocket } from "@/hooks/use-socket";
import { Loading } from "@/components/loading";

export default function Home() {
  const { sensorData, gyroChartData, accelChartData } = useSocket();

  if (!sensorData) {
    return <Loading />;
  }

  console.log(sensorData);

  return (
    <div className="p-2 sm:p-4 px-4 space-y-4 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-purple-800 mb-4 sm:mb-8">
        Sensor Data Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg col-span-1 sm:col-span-2 lg:col-span-3 rounded-lg">
          <LocationMap
            latitude={sensorData?.latitude}
            longitude={sensorData?.longitude}
            location={sensorData?.location}
          />
        </div>
        <div className=" sm:col-span-2 lg:col-span-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-1">
            <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg">
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Smartphone className="w-5 h-5" />
                  <span className="font-semibold">Device</span>
                </div>
                <div className="text-sm">
                  {sensorData.device.brand} {sensorData.device.model}
                </div>
                <div className="text-xs mt-1 opacity-80">
                  {sensorData.device.os} {sensorData.device.osVersion}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg">
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Speedometer className="w-5 h-5" />
                  <span className="font-semibold">Speed</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {sensorData.speed?.toFixed(2)}{" "}
                  <span className="text-sm font-normal">m/s</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-400 to-red-600 text-white shadow-lg">
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Compass className="w-5 h-5" />
                  <span className="font-semibold">Heading</span>
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {sensorData.heading?.toFixed(2)}°
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:gap-4 ">
        <Card className="bg-white shadow-lg mt-4">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center space-x-2 mb-2 sm:mb-4">
              <Crosshair className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-base sm:text-lg text-indigo-600">
                Gyroscope Data
              </span>
            </div>
            <ChartContainer
              config={{
                gyroX: {
                  label: "X",
                  color: "hsl(var(--chart-1))",
                },
                gyroY: {
                  label: "Y",
                  color: "hsl(var(--chart-2))",
                },
                gyroZ: {
                  label: "Z",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px] sm:h-[400px] w-full aspect-auto"
            >
              <LineChart data={gyroChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => value?.split(":")[1]}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  width={30}
                  tickFormatter={(value) => value?.toFixed(1)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="x"
                  stroke="var(--color-gyroX)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="var(--color-gyroY)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="z"
                  stroke="var(--color-gyroZ)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-lg mt-4">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center space-x-2 mb-2 sm:mb-4">
              <Mountain className="w-5 h-5 text-teal-600" />
              <span className="font-semibold text-base sm:text-lg text-teal-600">
                Accelerometer Data
              </span>
            </div>
            <ChartContainer
              config={{
                accelX: {
                  label: "X",
                  color: "hsl(var(--chart-1))",
                },
                accelY: {
                  label: "Y",
                  color: "hsl(var(--chart-2))",
                },
                accelZ: {
                  label: "Z",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px] sm:h-[400px] w-full aspect-auto"
            >
              <LineChart data={accelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => value?.split(":")[1]}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  width={30}
                  tickFormatter={(value) => value?.toFixed(1)}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="x"
                  stroke="var(--color-accelX)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="var(--color-accelY)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="z"
                  stroke="var(--color-accelZ)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
