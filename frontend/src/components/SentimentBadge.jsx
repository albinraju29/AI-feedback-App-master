import React from 'react';

const SentimentBadge = ({ sentiment }) => {
    const getStyles = () => {
        switch (sentiment?.toLowerCase()) {
            case 'positive':
                return {
                    background: '#d4edda',
                    color: '#155724'
                };
            case 'negative':
                return {
                    background: '#f8d7da',
                    color: '#721c24'
                };
            default:
                return {
                    background: '#fff3cd',
                    color: '#856404'
                };
        }
    };

    return (
        <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500',
            ...getStyles()
        }}>
            {sentiment || 'unknown'}
        </span>
    );
};

export default SentimentBadge;