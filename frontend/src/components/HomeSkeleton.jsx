import React from 'react'
import { Box, Skeleton } from '@mui/material'

function HomeSkeleton({ dimension }) {
  return (
    <Box display="flex" flexDirection="row" flexWrap="wrap">
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
        <Skeleton variant="circular" width={dimension} height={dimension} />
    </Box>
  )
}

export default HomeSkeleton