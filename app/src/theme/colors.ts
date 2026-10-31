export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  accent2: string;
  text: string;
  muted: string;
  card: string;
  border: string;
}

export const light: ThemeColors = {
  background: '#F5F0E8',
  surface: '#E8E0D0',
  primary: '#5B7B5A',
  secondary: '#8B6F47',
  accent: '#C97B3A',
  accent2: '#4A7B9D',
  text: '#2C2420',
  muted: '#8A7E72',
  card: '#EDE5D5',
  border: '#D8CEBC',
};

export const dark: ThemeColors = {
  background: '#1A1A18',
  surface: '#2A2520',
  primary: '#7B9B7A',
  secondary: '#AB8F67',
  accent: '#E89B4A',
  accent2: '#6A9BBD',
  text: '#E8E0D0',
  muted: '#7A6E62',
  card: '#35302A',
  border: '#454038',
};
