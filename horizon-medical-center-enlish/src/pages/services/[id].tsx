import React, { useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import ServicePageComponent from '../../components/ServicePage';
import { TextContent } from '../../types';
import { OutletContextType } from '../../App';


export default function ServiceDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const { fullData } = useOutletContext<OutletContextType>();

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const service = fullData?.content.services.find(s => s.id === id);
    
    useEffect(() => {
        if (service && fullData) {
            const currentText: TextContent = fullData[fullData.en ? 'en' : 'ar'];
            const serviceTitle = currentText[service.titleKey as keyof typeof currentText] || 'Dental Service';
            const serviceDescription = currentText[service.descriptionKey as keyof typeof currentText] || 'Learn more about our dental services.';
            
            document.title = `${serviceTitle} | Horizon Medical Center`;
            
            // Update meta description
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.setAttribute('name', 'description');
                document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', serviceDescription);
        }
    }, [service, fullData]);

    if (!fullData) {
        return null; // Loading is handled by App.tsx
    }

    if (!service) {
        return <div>Service not found</div>;
    }
    
    return (
        <ServicePageComponent service={service} />
    );
}
