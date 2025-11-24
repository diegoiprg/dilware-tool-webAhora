import { z } from 'zod';

export const WeatherSchema = z.object({
  temperature: z.string(),
  minTemperature: z.string(),
  maxTemperature: z.string(),
  humidity: z.string(),
  uvIndex: z.string(),
  weatherCode: z.number(),
  location: z.string(),
});
export type Weather = z.infer<typeof WeatherSchema>;

export const WeatherInputSchema = z.object({
  lat: z.number().optional(),
  lon: z.number().optional(),
});
export type WeatherInput = z.infer<typeof WeatherInputSchema>;
