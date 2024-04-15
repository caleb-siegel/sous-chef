import React from 'react'
import { Stack, Skeleton, Box } from '@mui/material'

function RecipeSkeleton() {
  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap">
        <Box>
            <Stack spacing={1} mr={4}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={210} height={200} />
                <Skeleton variant="rounded" width={210} height={30} />
                <Skeleton variant="rounded" width={210} height={30} />
            </Stack>
        </Box>
        <Box>
            <Stack spacing={1} mr={4}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={210} height={200} />
                <Skeleton variant="rounded" width={210} height={30} />
                <Skeleton variant="rounded" width={210} height={30} />
            </Stack>
        </Box>
        <Box>
            <Stack spacing={1} mr={4}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={210} height={200} />
                <Skeleton variant="rounded" width={210} height={30} />
                <Skeleton variant="rounded" width={210} height={30} />
            </Stack>
        </Box>
        <Box>
            <Stack spacing={1} mr={4}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={210} height={200} />
                <Skeleton variant="rounded" width={210} height={30} />
                <Skeleton variant="rounded" width={210} height={30} />
            </Stack>
        </Box>
        <Box>
            <Stack spacing={1} mr={4}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={210} height={200} />
                <Skeleton variant="rounded" width={210} height={30} />
                <Skeleton variant="rounded" width={210} height={30} />
            </Stack>
        </Box>
        <Box>
            <Stack spacing={1} mr={4}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={210} height={200} />
                <Skeleton variant="rounded" width={210} height={30} />
                <Skeleton variant="rounded" width={210} height={30} />
            </Stack>
        </Box>
        <Box>
            <Stack spacing={1} mr={4}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={210} height={200} />
                <Skeleton variant="rounded" width={210} height={30} />
                <Skeleton variant="rounded" width={210} height={30} />
            </Stack>
        </Box>
        <Box>
            <Stack spacing={1} mr={4}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="rectangular" width={210} height={200} />
                <Skeleton variant="rounded" width={210} height={30} />
                <Skeleton variant="rounded" width={210} height={30} />
            </Stack>
        </Box>
    </Box>
  )
}

export default RecipeSkeleton