import { Box, Flex, Link } from '@chakra-ui/react';
import NextLink from 'next/link'
import React from 'react'

interface NavbarProps {

}

const Navbar: React.FC<NavbarProps> = ({ }) => {
    return (
        <Flex bg={'tomato'} p={4}>
            <Box ml='auto'>
                <NextLink href='/login'>
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href='/register'>
                    <Link>Register</Link>
                </NextLink>
            </Box>
        </Flex>
    );
}
export default Navbar