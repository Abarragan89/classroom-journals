interface ColorSelectProps {
    setColor: (color: string) => void; // This will update the color in the form state
    selectedColor: string;
}

export default function ColorSelect({ setColor, selectedColor }: ColorSelectProps) {

    const colors = ["#dc2626", "#d97706", "#65a30d", "#0d9488", "#2563eb", "#9333ea"];

    return (
        <div className="flex flex-wrap">
            {colors.map(color => (
                <p
                    key={color}
                    style={{ backgroundColor: color }}
                    onClick={() => setColor(color)} // Set color when clicked
                    className={
                        `w-[25px] h-[25px] rounded-[50%] mr-4 hover:cursor-pointer
                        ${selectedColor === color ? 'border-4 border-accent' : ''}
                        `
                    }
                />
            ))}
        </div>
    )
}

