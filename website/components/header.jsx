import { ModeToggle } from "./mode-toggle";
import icon from '../assets/icon.png';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header(props) {
    return (
        <div className="border-b w-full bg-blue-500 text-white">
            <div className="flex items-center justify-between h-16 px-8">
                <div className="flex gap-x-4 items-center">
                    <Avatar>
                        <AvatarImage src={icon} className="h-6 w-auto" />
                        <AvatarFallback>CC</AvatarFallback>
                    </Avatar>
                    <h2 className="text-lg font-semibold">{props.title}</h2>
                </div>
                <ModeToggle />
            </div>
        </div>
    );
}