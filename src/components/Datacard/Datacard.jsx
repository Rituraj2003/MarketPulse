import React from 'react'

const Datacard = ({label,value}) => {
  return (
    <div className='datacard'>
      <div className='datacard-label'>{label}</div>
      <div className='datacard-value'>{value}</div>
    </div>
  )
}

export default Datacard
