interface SmallLoadingProps {
    size?: "sm" | "md" | "lg";
}

const SmallLoading = ({ size = "md" }: SmallLoadingProps) => (
    <div className={`
        flex 
        items-center 
        justify-center 
        ${size === "sm" ? "min-h-20 min-w-20" : size === "md" ? "min-h-74 min-w-40" : "min-h-[85vh] min-w-full"}
        min-w-40
    `}>
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
    </div>
);

export default SmallLoading;
