import * as React from 'react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export function ResponsiveDialog({
    children,
    isOpen,
    setIsOpen,
    title,
    description,
    showDescription = false,
}: {
    children: React.ReactNode;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    description?: string;
    showDescription?: boolean;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} onPointerMove={(e) => e.stopPropagation()}
                className="overflow-y-hidden p-4 rounded-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription className={`${showDescription ? '' : 'sr-only'}`} >{description}</DialogDescription>
                    )}
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}