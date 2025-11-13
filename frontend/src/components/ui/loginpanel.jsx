import styles from '../pages/Login.module.css'

function LoginPanel({
  formValues,
  onChange,
  onSubmit,
  errorMessage,
  statusMessage,
  isSubmitting
}) {
  return (
    <form className={styles.card} onSubmit={onSubmit}>
      <h1 className={styles.title}>Sign in to BookDB</h1>
      <p className={styles.subtitle}>
        Enter your username and password to access the dashboard.
      </p>
      <label className={styles.label} htmlFor='username'>
        Username
      </label>
      <input
        className={styles.input}
        id='username'
        name='username'
        type='text'
        autoComplete='username'
        value={formValues.username}
        onChange={onChange}
        placeholder='yourusername'
      />
      <label className={styles.label} htmlFor='password'>
        Password
      </label>
      <input
        className={styles.input}
        id='password'
        name='password'
        type='password'
        autoComplete='current-password'
        value={formValues.password}
        onChange={onChange}
        placeholder='********'
      />
      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}
      {statusMessage ? <p className={styles.success}>{statusMessage}</p> : null}
      <button className={styles.button} type='submit' disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}

export default LoginPanel
