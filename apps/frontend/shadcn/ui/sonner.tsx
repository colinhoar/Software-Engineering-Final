import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';
import '../styles.css';
import React from 'react';

const Toaster = (p0: string, { ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            //theme={theme as ToasterProps['theme']}
            className="toaster"
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
