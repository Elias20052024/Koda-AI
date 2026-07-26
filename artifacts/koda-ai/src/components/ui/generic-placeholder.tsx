import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function GenericPlaceholder({ title = "Coming Soon" }: { title?: string }) {
  return (
    <div className="flex h-[60vh] items-center justify-center animate-in fade-in">
      <Card className="max-w-md w-full text-center border-dashed">
        <CardContent className="pt-10 pb-10">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <div className="w-8 h-8 rounded-full border-4 border-muted-foreground/30 border-t-primary animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{title}</h2>
          <p className="text-muted-foreground mb-6">This module is currently under construction. Check back soon for updates.</p>
        </CardContent>
      </Card>
    </div>
  );
}
