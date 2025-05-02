interface ColorSelectProps {
    setColor: (color: string) => void; // This will update the color in the form state
    selectedColor: string;
}

export default function ColorSelect({ setColor, selectedColor }: ColorSelectProps) {

    // const colors = ["#dc2626", "#d97706", "#65a30d", "#0d9488", "#2563eb", "#9333ea"];
    // muted
    const colors = [
        "rgba(220, 38, 38, 0.90)",  // Muted Red  
        "rgba(217, 119, 6, 0.90)",  // Muted Orange  
        "rgba(101, 163, 13, 0.90)", // Muted Green  
        "rgba(13, 148, 136, 0.90)", // Muted Teal  
        "rgba(37, 99, 235, 0.90)",  // Muted Blue  
        "rgba(147, 51, 234, 0.90)"  // Muted Purple  
    ];


    return (
        <div className="flex flex-wrap">
            {colors.map(color => (
                <p
                    key={color}
                    style={{ backgroundColor: color }}
                    onClick={() => setColor(color)} // Set color when clicked
                    className={
                        `w-[25px] h-[25px] rounded-[50%] mr-[15px] hover:cursor-pointer
                        ${selectedColor === color ? 'border-4 border-foreground' : ''}
                        `
                    }
                />
            ))}
        </div>
    )
}

