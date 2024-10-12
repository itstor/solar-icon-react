<img src="https://raw.githubusercontent.com/itstor/solar-icons-react/refs/heads/main/images/banner.png">

# Solar Icon Set React Library

This is a React icon library for the Solar Icon Set, a large icon library consisting of modern pictograms with smooth corners.

## Installation

To install the library:

```bash
npm install solar-icons-react
```

## Usage

To use an icon from the library, import it into your React component. Here's an example:

```tsx
import React from 'react';
import { BoNotificationRemove } from 'solar-icons-react/bo';

const MyComponent = () => {
    return (
        <div>
            <BoNotificationRemove className="w-6 h-6 text-red-500" />
        </div>
    );
};

export default MyComponent;
```

### Compatibility

The icons in this library are compatible with `react-icons`' `IconType` type.

### Icon Modules

The library is structured into modules based on icon categories. Each module has its own directory and can be imported separately to reduce bundle size. The available modules and their abbreviations are:

- Bold: `Bo`
- Bold Duotone: `Bd`
- Broken: `Br`
- Line Duotone: `Ld`
- Linear: `Li`
- Outline: `Ol`

For example, to use a Bold icon, import it from the `bo` module:

```tsx
import { BoNotificationRemove } from 'solar-icons-react/bo';
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

The icons used in this project are from the "Solar Icon Set" and are licensed under the Creative Commons Attribution 4.0 International License (CC BY 4.0).

Icon Credits:  
Solar Icon Set by [480 Design](https://www.figma.com/@480design)  
Source: [Solar Icon Set Figma Community](https://www.figma.com/community/file/1166831539721848736/solar-icons-set)  
License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.
