import React from 'react'
import Button from '@material-ui/core/Button'
import Progress from '@material-ui/core/CircularProgress'
import { useFormikContext } from 'formik'

// todo: shouldn't rerender without prop change
const LoadingButton = React.memo((props) => {
  const { isSubmitting } = useFormikContext()

  return (
    <Button
      {...props}
      disabled={isSubmitting}
      >
      {!isSubmitting && props.children}
      {isSubmitting && <Progress />}
    </Button>
  )
})

export default LoadingButton