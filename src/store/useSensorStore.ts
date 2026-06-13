import { create } from 'zustand';

import { fetchAlerts, fetchSensors } from '../api/sensors';
import { Alert, Sensor, SensorFilter } from '../types';

interface SensorState {
  sensors: Sensor[];
  alerts: Alert[];
  loading: boolean;
  refreshing: boolean;
  lastUpdated: Date | null;
  selectedSensor: Sensor | null;
  filter: SensorFilter;
  loadSensors: () => Promise<void>;
  refreshSensors: () => Promise<void>;
  setSelectedSensor: (sensor: Sensor | null) => void;
  setFilter: (filter: SensorFilter) => void;
  acknowledgeAlert: (id: string) => void;
}

const mergeSelectedSensor = (current: Sensor | null, sensors: Sensor[]) => {
  if (!current) {
    return null;
  }

  return sensors.find((sensor) => sensor.id === current.id) ?? null;
};

export const useSensorStore = create<SensorState>((set, get) => ({
  sensors: [],
  alerts: [],
  loading: false,
  refreshing: false,
  lastUpdated: null,
  selectedSensor: null,
  filter: 'all',
  loadSensors: async () => {
    set({ loading: true });

    try {
      const [sensors, alerts] = await Promise.all([fetchSensors(), fetchAlerts()]);

      set({
        sensors,
        alerts,
        lastUpdated: new Date(),
        selectedSensor: mergeSelectedSensor(get().selectedSensor, sensors),
      });
    } finally {
      set({ loading: false });
    }
  },
  refreshSensors: async () => {
    set({ refreshing: true });

    try {
      const [sensors, alerts] = await Promise.all([fetchSensors(), fetchAlerts()]);

      set({
        sensors,
        alerts,
        lastUpdated: new Date(),
        selectedSensor: mergeSelectedSensor(get().selectedSensor, sensors),
      });
    } finally {
      set({ refreshing: false });
    }
  },
  setSelectedSensor: (sensor) => set({ selectedSensor: sensor }),
  setFilter: (filter) => set({ filter }),
  acknowledgeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),
}));