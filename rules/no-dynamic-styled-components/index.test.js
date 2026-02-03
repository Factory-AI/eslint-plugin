/**
 * @fileoverview Tests for no-dynamic-styled-components rule
 */

'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run('no-dynamic-styled-components', rule, {
  valid: [
    // Module-scoped styled component is allowed
    {
      code:
        `
        import styled from 'styled-components';
        const Wrapper = styled.div` +
        '/*css*/`color:red;`' +
        `;
        export function Comp(){ return <Wrapper/> }
      `,
      filename: '/path/to/Component.tsx',
    },
    // Namespace import at top-level allowed
    {
      code:
        `
        import * as styled from 'styled-components';
        const W = styled.div` +
        '/*css*/`color:green;`' +
        `;
        export const C = () => <W/>;
      `,
      filename: '/path/to/NamespaceOk.tsx',
    },
    // Using css helper inside a function is allowed
    {
      code:
        `
        import { css } from 'styled-components';
        function make(){ const styles = css` +
        '/*css*/`color:blue;`' +
        `; return styles }
      `,
      filename: '/path/to/utils.tsx',
    },
    // Top-level styled(Component) is allowed
    {
      code:
        `
        import styled from 'styled-components';
        const Base = (p) => <div {...p}/>;
        const Fancy = styled(Base)` +
        '/*css*/`margin:0;`' +
        `;
        export default Fancy;
      `,
      filename: '/path/to/Fancy.tsx',
    },
    // Stories/tests are ignored
    {
      code:
        `
        import styled from 'styled-components';
        export const Story = () => { const S = styled.div` +
        '/*css*/`gap:8px;`' +
        `; return <S/> };
      `,
      filename: '/path/to/Button.stories.tsx',
    },
    {
      code:
        `
        import styled from 'styled-components';
        function Test(){ const S = styled.div` +
        '/*css*/`gap:8px;`' +
        `; return <S/> }
      `,
      filename: '/path/to/Component.test.tsx',
    },
    // Not importing styled from styled-components => rule does nothing
    {
      code:
        `
        import somethingElse from 'other-lib';
        function Foo(){ const S = somethingElse.div` +
        '/*css*/`x:1;`' +
        `; return <S/> }
      `,
      filename: '/path/to/Foo.tsx',
    },
  ],

  invalid: [
    // Inside a component
    {
      code:
        `
        import styled from 'styled-components';
        export function Button(){
          const S = styled.button` +
        '/*css*/`color:red;`' +
        `;
          return <S/>;
        }
      `,
      filename: '/path/to/Button.tsx',
      errors: [{ messageId: 'noDynamicStyled' }],
    },
    // Namespace import inside function should fail
    {
      code:
        `
        import * as styled from 'styled-components';
        function Bad(){ const S = styled.span` +
        '/*css*/`color:purple;`' +
        `; return <S/> }
      `,
      filename: '/path/to/NamespaceBad.tsx',
      errors: [{ messageId: 'noDynamicStyled' }],
    },
    // styled(Component).attrs inside function should fail
    {
      code:
        `
        import styled from 'styled-components';
        const Base = (p) => <div {...p}/>;
        export function X(){ const S = styled(Base).attrs({ role: 'region' })` +
        '/*css*/`m:0;`' +
        `; return <S/> }
      `,
      filename: '/path/to/StyledCallAttrs.tsx',
      errors: [{ messageId: 'noDynamicStyled' }],
    },
    // Inside a regular function
    {
      code:
        `
        import styled from 'styled-components';
        function make(){
          return styled.div` +
        '/*css*/`padding:4px;`' +
        `;
        }
      `,
      filename: '/path/to/make.tsx',
      errors: [{ messageId: 'noDynamicStyled' }],
    },
    // Chained member expression (attrs) inside function
    {
      code:
        `
        import styled from 'styled-components';
        const Fn = () => {
          const S = styled.div.attrs({ role: 'button' })` +
        '/*css*/`display:block;`' +
        `;
          return <S/>;
        };
      `,
      filename: '/path/to/Attrs.tsx',
      errors: [{ messageId: 'noDynamicStyled' }],
    },
  ],
});

console.log('All no-dynamic-styled-components tests passed!');
