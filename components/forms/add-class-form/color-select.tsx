interface ColorSelectProps {
    setColor: (color: string) => void; // This will update the color in the form state
    selectedColor: string;
}

export default function ColorSelect({ setColor, selectedColor }: ColorSelectProps) {

    const colors = ["#f87171", "#fb923c", "#e11d48", "#a3e635", "#22d3ee", "#a78bfa"];

    return (
        <div className="flex flex-wrap">
            {colors.map(color => (
                <p
                    key={color}
                    style={{ backgroundColor: color }}
                    onClick={() => setColor(color)} // Set color when clicked
                    className={
                        `w-[25px] h-[25px] rounded-[50%] mr-4 hover:cursor-pointer
                        ${selectedColor === color ? 'border-4 border-white' : ''}
                        
                        `
                    }
                />
            ))}
        </div>
    )
}

