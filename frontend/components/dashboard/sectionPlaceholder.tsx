interface SectionPlaceholderProps {
    title: string;
    description: string;
}

const SectionPlaceholder = ({ title, description }: SectionPlaceholderProps) => (
    <div>
        <h1 className="lg:text-display text-title lg:text-left text-center font-bold text-black pb-6">{title}</h1>
        <p className="text-normal font-regular text-black lg:pb-20 pb-8">{description}</p>
    </div>
);

export default SectionPlaceholder;

