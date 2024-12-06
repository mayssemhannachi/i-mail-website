import React from "react";
import Avatar from "react-avatar";
import Select from "react-select";
import useThreads from "~/hooks/use-threads";
import { api } from "~/trpc/react";

type Props = {
    placeholder: string;
    label: string;
    onChange: (values: { label: string; value: string }[]) => void;
    value: { label: string; value: string }[];
};

const TagInput = ({ placeholder, label, onChange, value }: Props) => {
    const { accountId } = useThreads();
    const { data: suggestions } = api.account.getSuggestions.useQuery({
        accountId,
    });

    const [inputValue, setInputValue] = React.useState('');

    const options =
        suggestions
            ?.map((suggestion) => {
                // Extract name and email from the suggestion
                const nameMatch = suggestion.address.match(/^(.*)<[^>]+>$/);
                const extractedName =
                    nameMatch && nameMatch[1] ? nameMatch[1].trim() : suggestion.address;

                const emailMatch = suggestion.address.match(/<([^>]+)>/);
                const email = emailMatch ? emailMatch[1] : suggestion.address;

                return {
                    label: extractedName,
                    value: email || "", // Ensure value is always a string
                };
            })
            .filter((option) => option.value !== ""); // Exclude invalid emails

    return (
        <div className="border rounded-md flex items-center">
            <span className="ml-3 text-sm text-gray-500">{label}</span>
            <Select
                onInputChange={(newValue) => {
                    setInputValue(newValue);
                }}
                value={value}
                onChange={(selectedOptions) => {
                    const selected = Array.isArray(selectedOptions)
                        ? selectedOptions.map((option) => ({
                              label: option.label,
                              value: option.value,
                          }))
                        : [];

                    console.log("Selected options:", selected); // Debugging
                    onChange(selected); // Pass updated value to parent
                }}
                className="w-full flex-1"
                options={
                    inputValue
                        ? options?.concat({
                              label: inputValue,
                              value: inputValue,
                          })
                        : options
                }
                isMulti
                formatOptionLabel={(option) => (
                    <span className="flex items-center gap-2">
                        <Avatar
                            name={option.label}
                            size="25"
                            textSizeRatio={2}
                            round={true}
                        />
                        {option.label}
                    </span>
                )}
                placeholder={placeholder}
            />
        </div>
    );
};

export default TagInput;