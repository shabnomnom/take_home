function Employees(props) {
  const name = props.name;
  const id = props.id;
  return (
      <h4>
        Name : {name}
        id : {id}
      </h4>
  )
}

export default Employees