import { Alert, AlertSeverity, Sensor, SensorStatus, SensorType } from '../types';

type SensorSeed = Omit<Sensor, 'unit' | 'lastReading' | 'history'>;

const sensorSeeds: SensorSeed[] = [
  {
    id: 'SNS-001',
    name: 'Nairobi Central Pump Station',
    county: 'Nairobi',
    type: 'flow',
    status: 'warning',
    value: 487,
    batteryLevel: 78,
    signalStrength: 4,
    lat: -1.2864,
    lon: 36.8172,
    alertCount: 2,
  },
  {
    id: 'SNS-002',
    name: 'Mombasa Island Pressure Valve',
    county: 'Mombasa',
    type: 'pressure',
    status: 'online',
    value: 6.4,
    batteryLevel: 91,
    signalStrength: 3,
    lat: -4.0435,
    lon: 39.6682,
    alertCount: 0,
  },
  {
    id: 'SNS-003',
    name: 'Kisumu Lake Intake Quality Node',
    county: 'Kisumu',
    type: 'quality',
    status: 'warning',
    value: 8.3,
    batteryLevel: 64,
    signalStrength: 3,
    lat: -0.0917,
    lon: 34.768,
    alertCount: 1,
  },
  {
    id: 'SNS-004',
    name: 'Nakuru West Reservoir Level',
    county: 'Nakuru',
    type: 'level',
    status: 'online',
    value: 72,
    batteryLevel: 83,
    signalStrength: 4,
    lat: -0.3031,
    lon: 36.08,
    alertCount: 0,
  },
  {
    id: 'SNS-005',
    name: 'Eldoret North Pipeline Flow',
    county: 'Eldoret',
    type: 'flow',
    status: 'offline',
    value: 0,
    batteryLevel: 12,
    signalStrength: 0,
    lat: 0.5143,
    lon: 35.2698,
    alertCount: 3,
  },
  {
    id: 'SNS-006',
    name: 'Thika Industrial Pressure Main',
    county: 'Thika',
    type: 'pressure',
    status: 'warning',
    value: 1.7,
    batteryLevel: 45,
    signalStrength: 2,
    lat: -1.0333,
    lon: 37.0693,
    alertCount: 2,
  },
  {
    id: 'SNS-007',
    name: 'Machakos Treatment pH Sensor',
    county: 'Machakos',
    type: 'quality',
    status: 'online',
    value: 7.2,
    batteryLevel: 88,
    signalStrength: 4,
    lat: -1.5177,
    lon: 37.2634,
    alertCount: 0,
  },
  {
    id: 'SNS-008',
    name: 'Nyeri Hill Tank Level Monitor',
    county: 'Nyeri',
    type: 'level',
    status: 'warning',
    value: 93,
    batteryLevel: 58,
    signalStrength: 3,
    lat: -0.4201,
    lon: 36.9476,
    alertCount: 1,
  },
  {
    id: 'SNS-009',
    name: 'Meru East Distribution Flow',
    county: 'Meru',
    type: 'flow',
    status: 'online',
    value: 226,
    batteryLevel: 76,
    signalStrength: 4,
    lat: 0.047,
    lon: 37.6498,
    alertCount: 0,
  },
  {
    id: 'SNS-010',
    name: 'Garissa Borehole Pressure Node',
    county: 'Garissa',
    type: 'pressure',
    status: 'online',
    value: 5.3,
    batteryLevel: 69,
    signalStrength: 2,
    lat: -0.4569,
    lon: 39.6583,
    alertCount: 0,
  },
  {
    id: 'SNS-011',
    name: 'Kitale Storage Tank Level',
    county: 'Kitale',
    type: 'level',
    status: 'online',
    value: 61,
    batteryLevel: 94,
    signalStrength: 4,
    lat: 1.0157,
    lon: 35.0062,
    alertCount: 0,
  },
  {
    id: 'SNS-012',
    name: 'Kakamega River Intake Quality',
    county: 'Kakamega',
    type: 'quality',
    status: 'offline',
    value: 6.9,
    batteryLevel: 18,
    signalStrength: 1,
    lat: 0.2827,
    lon: 34.7519,
    alertCount: 2,
  },
];

const unitsByType: Record<SensorType, string> = {
  flow: 'L/min',
  pressure: 'bar',
  quality: 'pH',
  level: '%',
};

const rangesByType: Record<SensorType, [number, number]> = {
  flow: [0, 500],
  pressure: [1, 10],
  quality: [6.5, 8.5],
  level: [0, 100],
};

const varianceByType: Record<SensorType, number> = {
  flow: 46,
  pressure: 0.65,
  quality: 0.18,
  level: 8,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const roundForType = (type: SensorType, value: number) => {
  if (type === 'quality' || type === 'pressure') {
    return Number(value.toFixed(1));
  }

  return Math.round(value);
};

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const randomRecentIso = (hours: number) =>
  new Date(Date.now() - randomBetween(4 * 60 * 1000, hours * 60 * 60 * 1000)).toISOString();

const varyValue = (type: SensorType, value: number, multiplier = 1) => {
  const [min, max] = rangesByType[type];
  const varied = value + randomBetween(-varianceByType[type], varianceByType[type]) * multiplier;

  return roundForType(type, clamp(varied, min, max));
};

const buildHistory = (type: SensorType, currentValue: number) => {
  const [min, max] = rangesByType[type];
  const waveSize = varianceByType[type] * 0.7;

  return Array.from({ length: 24 }, (_, index) => {
    const trend = Math.sin(index / 3.2) * waveSize;
    const noise = randomBetween(-varianceByType[type], varianceByType[type]) * 0.45;
    return roundForType(type, clamp(currentValue + trend + noise, min, max));
  });
};

const buildSensor = (seed: SensorSeed): Sensor => ({
  ...seed,
  unit: unitsByType[seed.type],
  value: roundForType(seed.type, seed.value),
  lastReading: randomRecentIso(2),
  history: buildHistory(seed.type, seed.value),
});

const alertMessages: Array<{
  id: string;
  sensorId: string;
  severity: AlertSeverity;
  message: string;
  acknowledged: boolean;
}> = [
  {
    id: 'ALT-001',
    sensorId: 'SNS-001',
    severity: 'critical',
    message: 'Flow rate exceeded threshold: 487 L/min',
    acknowledged: false,
  },
  {
    id: 'ALT-002',
    sensorId: 'SNS-006',
    severity: 'critical',
    message: 'Pressure dropped below safe operating range: 1.7 bar',
    acknowledged: false,
  },
  {
    id: 'ALT-003',
    sensorId: 'SNS-003',
    severity: 'warning',
    message: 'pH level approaching upper limit: 8.3 pH',
    acknowledged: false,
  },
  {
    id: 'ALT-004',
    sensorId: 'SNS-008',
    severity: 'warning',
    message: 'Reservoir level near capacity: 93%',
    acknowledged: false,
  },
  {
    id: 'ALT-005',
    sensorId: 'SNS-005',
    severity: 'critical',
    message: 'No telemetry received from field node for 42 minutes',
    acknowledged: false,
  },
  {
    id: 'ALT-006',
    sensorId: 'SNS-012',
    severity: 'warning',
    message: 'Signal degraded at river intake quality monitor',
    acknowledged: true,
  },
  {
    id: 'ALT-007',
    sensorId: 'SNS-010',
    severity: 'info',
    message: 'Scheduled calibration window due within 48 hours',
    acknowledged: false,
  },
  {
    id: 'ALT-008',
    sensorId: 'SNS-004',
    severity: 'info',
    message: 'Reservoir level returned to normal operating range',
    acknowledged: true,
  },
];

const delay = <T>(durationMs: number, valueFactory: () => T) =>
  new Promise<T>((resolve) => {
    setTimeout(() => resolve(valueFactory()), durationMs);
  });

export const fetchSensors = (): Promise<Sensor[]> => delay(600, () => sensorSeeds.map(buildSensor));

export const fetchAlerts = (): Promise<Alert[]> =>
  delay(400, () =>
    alertMessages.map((alert) => {
      const sensor = sensorSeeds.find((item) => item.id === alert.sensorId);

      return {
        ...alert,
        sensorName: sensor?.name ?? 'Unknown field sensor',
        county: sensor?.county ?? 'Unknown',
        timestamp: randomRecentIso(6),
      };
    }),
  );

export const refreshSensor = (id: string): Promise<Sensor> =>
  delay(300, () => {
    const seed = sensorSeeds.find((sensor) => sensor.id === id);

    if (!seed) {
      throw new Error(`Sensor ${id} was not found`);
    }

    const refreshedValue = varyValue(seed.type, seed.value, 0.4);

    return {
      ...buildSensor({ ...seed, value: refreshedValue }),
      lastReading: new Date().toISOString(),
    };
  });

export const getStatusColorKey = (status: SensorStatus) => {
  if (status === 'warning') {
    return 'warning';
  }

  if (status === 'offline') {
    return 'danger';
  }

  return 'success';
};