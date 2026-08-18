import { ReactSearchAutocomplete } from 'react-search-autocomplete';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../components/auth_context.tsx';

const HomePageSearch = () => {
    const navigate = useNavigate();
    const { isLoggedIn, isAdmin } = useAuth();
    const items = [
        {
            url: '/navigation',
            name: 'Navigation',
        },
        {
            url: '/navigation',
            name: 'Directions',
        },
        {
            url: '/about',
            name: 'About the Team',
        },
        {
            url: '/credits',
            name: 'Credits',
        },
        {
            url: '/about',
            name: 'Aditya Manoj Krishna',
        },
        {
            url: '/about',
            name: 'Cole Golding',
        },
        {
            url: '/about',
            name: 'Matthew Winchell',
        },
        {
            url: '/about',
            name: 'Ryan Zhang',
        },
        {
            url: '/about',
            name: 'Aliza Khalil',
        },
        {
            url: '/about',
            name: 'Christopher Yon',
        },
        {
            url: '/about',
            name: 'Colin Hoar',
        },
        {
            url: '/about',
            name: 'Jared LaPlante',
        },
        {
            url: '/about',
            name: 'Mohammed Musawwir',
        },
        {
            url: '/about',
            name: 'Catherine Foley',
        },
        ...(isLoggedIn
            ? [
                  {
                      url: '/services',
                      name: 'Services',
                  },
                  {
                      url: '/services/languagerequest',
                      name: 'Language Interpreter Request',
                  },
                {
                    url: '/services/languagerequest',
                    name: 'Translator Request',
                },
                  {
                      url: '/services/patienttransportationrequest',
                      name: 'Patient Transportation Request',
                  },
                {
                    url: '/services/patienttransportationrequest',
                    name: 'Move Patient',
                },
                  {
                      url: '/manageAccounts',
                      name: 'Account Management',
                  },
                {
                    url: '/manageAccounts',
                    name: 'Change/Set Password',
                },
                  {
                      url: '/services/facilitymaintenancerequest',
                      name: 'Facility Maintenance Request',
                  },
                {
                    url: '/services/facilitymaintenancerequest',
                    name: 'Repair Request',
                },
                  {
                      url: '/services/sanitationrequest',
                      name: 'Sanitation Request',
                  },
                {
                    url: '/services/sanitationrequest',
                    name: 'Cleaning Request',
                },
                  {
                      url: '/services/security-request',
                      name: 'Security Request',
                  },
                  {
                      url: '/services/servicerequests',
                      name: 'All Service Requests',
                  },

                  ...(isAdmin
                      ? [
                            {
                                url: '/services/mapediting',
                                name: 'Map Editing',
                            },
                          {
                              url: '/services/mapediting',
                              name: 'Path Edit',
                          },

                            {
                                url: '/services/employee',
                                name: 'Employee Management',
                            },
                            {
                              url: '/services/employee',
                              name: 'Staff Management',
                            },
                            {
                                url: '/services/importexport',
                                name: 'Directory Import/Export',
                            },
                          {
                              url: '/services/importexport',
                              name: 'Update Departments',
                          },
                            {
                                  url: '/services/summary',
                                  name: 'Service Request Summary',
                            },
                            {
                                  url: '/services/summary',
                                  name: 'Statistics',
                            },
                          {
                              url: '/services/summary',
                              name: 'Overview',
                          },


                        ]
                      : []),
              ]
            : []),
    ];
    const [firstResult, setFirstResult] = useState('');
    const [mouseEntered, setMouseEntered] = useState(false);

    const handleOnSearch = (string: string, results: typeof items) => {
        // onSearch will have as the first callback parameter
        // the string searched and for the second the results.
        if (results.length > 0) {
            setFirstResult(results[0].url);
        } else {
            setFirstResult('');
        }
    };

    const handleOnHover = (result: (typeof items)[0]) => {
        // the item hovered
        if (!mouseEntered){
            setFirstResult(result.url);
        }
    };

    const handleOnSelect = (item: (typeof items)[0]) => {
        // the item selected
        navigate(item.url);
    };

    const handleOnFocus = () => {
        setFirstResult('');
    };

    const formatResult = (item: (typeof items)[0]) => {
        return (
            <>
                <span style={{ display: 'block', textAlign: 'left' }}>{item.name}</span>
            </>
        );
    };

    return (
        <div
            className={'max-w-lg'}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && firstResult) {
                    navigate(firstResult);
                }
            }}
            onMouseEnter={() => setMouseEntered(true)}
            onMouseLeave={() => setMouseEntered(false)}
        >
            <ReactSearchAutocomplete
                items={items}
                onSearch={handleOnSearch}
                onHover={handleOnHover}
                onSelect={handleOnSelect}
                onFocus={handleOnFocus}
                autoFocus
                formatResult={formatResult}
                placeholder={'Quickly navigate to a specific page'}
                maxResults={7}
            />
        </div>
    );
};

export default HomePageSearch;
