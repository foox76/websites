import React from 'react';

interface SchemaMarkupProps {
  schema: object;
}

const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ schema }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
    />
  );
};

export default SchemaMarkup;
