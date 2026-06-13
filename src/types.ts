export type SensorType = 'flow' | 'pressure' | 'quality' | 'level';

export type SensorStatus = 'online' | 'warning' | 'offline';

export type SensorFilter = 'all' | SensorStatus;

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Sensor {
  id: string;
  name: string;
  county: string;
  type: SensorType;
  status: SensorStatus;
  value: number;
  unit: string;
  lastReading: string;
  batteryLevel: number;
  signalStrength: number;
  history: number[];
  lat: number;
  lon: number;
  alertCount: number;
}

export interface Alert {
  id: string;
  sensorId: string;
  sensorName: string;
  county: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}