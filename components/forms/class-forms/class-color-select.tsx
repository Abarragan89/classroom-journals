interface ColorSelectProps {
    setColor: (color: string) => void; // This will update the color in the form state
    selectedColor: string;
}

export default function ColorSelect({ setColor, selectedColor }: ColorSelectProps) {

    // Chart color options (1-5)
    const colorOptions = [
        { value: '1', label: 'Color 1' },
        { value: '2', label: 'Color 2' },
        { value: '3', label: 'Color 3' },
        { value: '4', label: 'Color 4' },
        { value: '5', label: 'Color 5' },
    ];

    return (
        <div className="flex flex-wrap gap-3">
            {colorOptions.map(({ value, label }) => (
                <button
                    key={value}
                    type="button"
                    onClick={() => setColor(value)}
                    aria-label={`Select ${label}`}
                    aria-pressed={selectedColor === value}
                    className={`
                        w-[25px] h-[25px] rounded-full hover:cursor-pointer transition-all
                        ${selectedColor === value ? 'ring-4 ring-ring ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'}
                    `}
                    style={{ backgroundColor: `var(--chart-${value})` }}
                />
            ))}
        </div>
    )
}
