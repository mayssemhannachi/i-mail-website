import React from "react";
import Avatar from "react-avatar";
import Select  from "react-select";
import { Label } from "recharts";
import useThreads from "~/hooks/use-threads";
import { api } from "~/trpc/react";


type Props ={
    placeholder:string
    label:string
    onChange:(values:{label:string , value:string}[])=>void
    value:{label:string, value:string}[]
    defaultToolbarExpand?: boolean;

}

const TagInput = ({placeholder,label,onChange,value}:Props) => {
    const {accountId} = useThreads();
    const {data: suggestions} = api.account.getSuggestions.useQuery({
        accountId
    })

    const [inputValue,setInputValue] = React.useState('')

    const options = suggestions?.map((suggestion) => {
        // Utilisation d'une regex pour extraire la partie hors des chevrons "< >"
        const nameMatch = suggestion.address.match(/^(.*)<[^>]+>$/);
        //@ts-ignore
        const extractedName = nameMatch ? nameMatch[1].trim() : suggestion.address;
    
        const emailMatch = suggestion.address.match(/<([^>]+)>/);
        const email = emailMatch ? emailMatch[1] : suggestion.address;
    
        return {
            label: (
                <span className="flex items-center gap-2">
                    <Avatar
                        name={extractedName} // Nom sans guillemets
                        size="25"
                        textSizeRatio={2}
                        round={true}
                    />
                    {extractedName} {/* Affiche le nom sans guillemets */}
                </span>
            ),
            value: email, // Utilise l'email extrait ou l'adresse complète
        };
    });
    
    return (
        <div className="border rounded-md flex items-center ">
            <span className="ml-3 text-sm text-gray-500">
                {label}
            </span>
            <Select
            onInputChange={setInputValue}
            value={value}
            //@ts-ignore
            onChange={onChange}
            className="w-full flex-1"
            //@ts-ignore
            options= {inputValue? options?.concat({
                //@ts-ignore
                label:inputValue,
                value:inputValue
            }):options}
            placeholder={placeholder}
            classNames={{
                control: () => {
                    return '!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none dark:bg-transparent'
                },
                multiValue: () => {
                    return 'dark:!bg-gray-700'
                },
                multiValueLabel: () => {
                    return 'dark:text-white dark:bg-gray-700 rounded-md'
                }
            }}
            />
        </div>
        )

}


export default TagInput;  // export default TagInput;