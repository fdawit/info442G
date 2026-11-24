//Reusable card for a single listing with a photo, the name, the category, and address
//Used for food reosurces for now, but will be used for benefit programs alter

import placeholderImage from '../assets/placeholder-food.svg';
import './ResourceCard.css';

export default function ResourceCard({
  name, category, address, photo, children, resultNumber, onSelect, selected
}) {
  function handleImageError(event) {
    event.currentTarget.src = placeholderImage;
  }

  return (
    <article className="resource-card" onClick={onSelect}>
      <img className="resource-card-photo" src={photo || placeholderImage} alt={photo ? 'Photo of ' + name : ''} onError={handleImageError} />
      <div className="resource-card-body">
        <div className="resource-card-info">
          <h3 className="resource-card-name">
            {resultNumber && <span className="resource-card-number">{resultNumber}</span>}
            {onSelect ? (
              <button className="resource-select-button" type="button" aria-pressed={selected}>
                {name || 'Name not available'}
              </button>
            ) : (
              name || 'Name not available'
            )}
          </h3>
          <p className="resource-card-category">{category || 'Category not available'}</p>
          <p className="resource-card-address">{address || 'Address not available'}</p>
        </div>
        {children}
      </div>
    </article>
  );
}
