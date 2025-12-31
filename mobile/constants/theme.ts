
export const theme = {
    colors: {
        background: '#0F172A', // Slate 900
        surface: 'rgba(30, 41, 59, 0.7)', // Slate 800 with opacity
        surfaceHighlight: 'rgba(51, 65, 85, 0.8)', // Slate 700 with opacity
        primary: '#6366F1', // Indigo 500
        primaryDark: '#4338CA', // Indigo 700
        secondary: '#8B5CF6', // Violet 500
        accent: '#06B6D4', // Cyan 500
        text: {
            primary: '#F8FAFC', // Slate 50
            secondary: '#94A3B8', // Slate 400
            tertiary: '#64748B', // Slate 500
        },
        success: '#10B981', // Emerald 500
        error: '#EF4444', // Red 500
        warning: '#F59E0B', // Amber 500
        overlay: 'rgba(0, 0, 0, 0.7)',
        white: '#FFFFFF',
        transparent: 'transparent',
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        round: 9999,
    },
    typography: {
        h1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
        h2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
        h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
        body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
        caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
        small: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
    },
};
