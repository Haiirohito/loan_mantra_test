import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface CalculatorInputProps {
    value: number;
    onValueChange: (value: number) => void;
    label: string;
    min: number;
    max: number;
    step?: number;
    type?: "currency" | "percent" | "number" | "years";
    showSlider?: boolean;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

const formatValue = (val: number, type: CalculatorInputProps["type"]) => {
    if (!Number.isFinite(val)) return "";
    if (type === "currency") {
        try {
            return new Intl.NumberFormat("en-IN").format(Math.round(val));
        } catch {
            return String(Math.round(val));
        }
    }
    return String(val);
};

const CalculatorInput: React.FC<CalculatorInputProps> = ({
    value,
    onValueChange,
    label,
    min,
    max,
    step = 1,
    type = "number",
    showSlider = true,
    className,
    placeholder,
    disabled = false,
}) => {
    const [inputValue, setInputValue] = useState<string>("");

    // Sync internal input state when prop value changes
    useEffect(() => {
        setInputValue(formatValue(value, type));
    }, [value, type]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        // Allow empty string for better typing experience
        if (rawValue === "") {
            setInputValue("");
            return;
        }

        // Remove commas for validation
        const cleanValue = rawValue.replace(/,/g, "");

        // Allow only numbers (and decimal point if step is not integer)
        if (/^[0-9]*\.?[0-9]*$/.test(cleanValue)) {
            setInputValue(rawValue);
        }
    };

    const handleBlur = () => {
        const cleanValue = inputValue.replace(/,/g, "");
        let numValue = parseFloat(cleanValue);

        if (!Number.isFinite(numValue)) {
            // Revert to current prop value if invalid
            setInputValue(formatValue(value, type));
            return;
        }

        // Clamp value
        numValue = Math.min(Math.max(numValue, min), max);

        // Round if needed (based on step)
        if (step >= 1) {
            numValue = Math.round(numValue);
        } else {
            // preserve decimal precision based on step
            const decimals = step.toString().split(".")[1]?.length || 0;
            numValue = Number(numValue.toFixed(decimals));
        }

        onValueChange(numValue);
        setInputValue(formatValue(numValue, type));
    };

    const handleSliderChange = (vals: number[]) => {
        const newVal = vals[0];
        onValueChange(newVal);
        setInputValue(formatValue(newVal, type));
    };

    const getUnitLabel = () => {
        switch (type) {
            case "percent": return "%";
            case "years": return "Years";
            default: return "";
        }
    };

    const formatMinMax = (val: number) => {
        if (type === "currency") {
            if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
            if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lac`;
            if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
            return `₹${val}`;
        }
        return val + (type === "percent" ? "%" : type === "years" ? " Years" : "");
    }

    return (
        <div className={cn("space-y-4", className, disabled && "opacity-50 pointer-events-none")}>
            <div>
                <Label className="text-base font-semibold mb-4 block">{label}</Label>
                <div className="flex items-center gap-4 mb-4">
                    <Input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className="text-lg"
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                    {getUnitLabel() && <span className="text-muted-foreground">{getUnitLabel()}</span>}
                </div>

                {showSlider && (
                    <>
                        <Slider
                            value={[value]}
                            onValueChange={handleSliderChange}
                            min={min}
                            max={max}
                            step={step}
                            className="mb-2"
                            disabled={disabled}
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formatMinMax(min)}</span>
                            <span>{formatMinMax(max)}</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CalculatorInput;
