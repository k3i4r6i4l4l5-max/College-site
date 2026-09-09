import React, { createContext, useContext } from 'react';

const CatalogContext = createContext(null);

export function CatalogProvider({ catalog, children }) {
  const topicsById = Object.fromEntries(catalog.topics.map(topic => [topic.id, topic]));
  const coursesById = Object.fromEntries(catalog.courses.map(course => [course.id, course]));
  const value = {
    ...catalog,
    topicById: id => topicsById[id],
    courseById: id => coursesById[id],
    courseForTopic: id => catalog.courses.find(course => course.topics.includes(id)),
  };
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error('Каталог недоступен вне CatalogProvider.');
  return value;
}
