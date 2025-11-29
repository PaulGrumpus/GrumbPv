interface SectionPlaceholderProps {
    title: string;
    description: string;
}

const SectionPlaceholder = ({ title, description }: SectionPlaceholderProps) => (
    <div>
        <h1 className="text-display font-bold text-black pb-6">{title}</h1>
        <p className="text-normal font-regular text-black pb-20">{description}</p>
    </div>
);

export default SectionPlaceholder;

