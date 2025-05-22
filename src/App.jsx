import React, { useState } from 'react';
import cn from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const products = productsFromServer.map(product => {
  const category = categoriesFromServer.find(c => c.id === product.categoryId);
  const user = usersFromServer.find(u => u.id === category?.ownerId);

  return { ...product, category, user };
});

export const App = () => {
  const [userId, setUserId] = useState(0);
  const [query, setQuery] = useState('');
  const [categoryIds, setCategoryIds] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [reversed, setReversed] = useState(false);

  const resetAllFilters = () => {
    setQuery('');
    setUserId(0);
    setCategoryIds([]);
  };

  const handleTableSort = field => {
    if (sortBy !== field) {
      setSortBy(field);
      setReversed(false);
    } else if (!reversed) {
      setReversed(true);
    } else {
      setSortBy('');
      setReversed(false);
    }
  };

  let visibleProducts = [...products];

  if (userId) {
    visibleProducts = visibleProducts.filter(p => p.user?.id === userId);
  }

  if (query) {
    const lowerQuery = query.toLowerCase();

    visibleProducts = visibleProducts.filter(p =>
      p.name.toLowerCase().includes(lowerQuery));
  }

  if (categoryIds.length > 0) {
    visibleProducts = visibleProducts.filter(p =>
      categoryIds.includes(p.categoryId));
  }

  if (sortBy) {
    visibleProducts.sort((a, b) => {
      switch (sortBy) {
        case 'id':
          return a.id - b.id;
        case 'product':
          return a.name.localeCompare(b.name);
        case 'category':
          return (a.category?.title || '').localeCompare(
            b.category?.title || '',
          );
        case 'user':
          return (a.user?.name || '').localeCompare(b.user?.name || '');
        default:
          return 0;
      }
    });
  }

  if (reversed) {
    visibleProducts.reverse();
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': userId === 0 })}
                onClick={() => setUserId(0)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  key={user.id}
                  href="#/"
                  className={cn({ 'is-active': user.id === userId })}
                  onClick={() => setUserId(user.id)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="search"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>
                {query && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': categoryIds.length !== 0,
                })}
                onClick={() => setCategoryIds([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => {
                const isActive = categoryIds.includes(category.id);

                return (
                  <a
                    data-cy="Category"
                    key={category.id}
                    className={cn('button mr-2 my-1', {
                      'is-info': isActive,
                    })}
                    href="#/"
                    onClick={() => {
                      setCategoryIds(current =>
                        isActive
                          ? current.filter(id => id !== category.id)
                          : [...current, category.id]);
                    }}
                  >
                    {category.title}
                  </a>
                );
              })}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={resetAllFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {['id', 'product', 'category', 'user'].map(field => (
                    <th key={field}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {field[0].toUpperCase() + field.slice(1)}
                        <a href="#/" onClick={() => handleTableSort(field)}>
                          <span className="icon">
                            <i
                              data-cy="SortIcon"
                              className={cn('fas', {
                                'fa-sort': sortBy !== field,
                                'fa-sort-up': sortBy === field && !reversed,
                                'fa-sort-down': sortBy === field && reversed,
                              })}
                            />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr key={product.id} data-cy="Product">
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>
                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">
                      {product.category
                        ? `${product.category.icon} - ${product.category.title}`
                        : '-'}
                    </td>
                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': product.user?.gender === 'm',
                        'has-text-danger': product.user?.gender === 'f',
                      })}
                    >
                      {product.user?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
